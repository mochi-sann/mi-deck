import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { signToken } from '../lib/jwt';
import type { SignUpInput, LoginInput } from '../validators/auth.validator';
import type { LoginResponse, SafeUser, JwtPayload, MeResponseType } from '../types/auth.types';
import { HTTPException } from 'hono/http-exception';
import { UserRole } from '~/generated/prisma';

export class AuthService {
  constructor() {}

  async signUp(input: SignUpInput): Promise<LoginResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new HTTPException(409, { message: 'このメールアドレスは既に使用されています。' });
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.username,
        userRole: UserRole.USER,
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    const accessToken = await signToken(payload);
    return { accessToken };
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await this.validateUser(input.email, input.password);
    if (!user) {
      throw new HTTPException(401, { message: 'メールアドレスまたはパスワードが無効です。' });
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = await signToken(payload);
    return { accessToken };
  }

  async validateUser(email: string, pass: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async me(userId: string): Promise<MeResponseType> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // MeResponseType に合わせて選択するフィールドを指定
        id: true,
        email: true,
        name: true,
        userRole: true,
        // createdAt: true, // 必要であれば追加
        // updatedAt: true, // 必要であれば追加
      }
    });

    if (!user) {
      throw new HTTPException(404, { message: 'ユーザーが見つかりません。' });
    }
    // MeEntityのコンストラクタに合わせる (nameがnullの場合も考慮)
    return {
        id: user.id,
        email: user.email,
        name: user.name ?? null, // name が null の場合は null を設定
        userRole: user.userRole,
    };
  }

  async logout(_userId: string): Promise<{ message: string }> {
    // JWTはステートレスなので、サーバー側でのログアウトは通常クライアント側でのトークン削除を意味します。
    // NestJSの実装に合わせてメッセージを返すだけにします。
    // 必要であれば、トークンのブラックリスト管理などをここに追加できます。
    return { message: "ログアウトしました" };
  }
}
