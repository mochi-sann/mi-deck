import { User as PrismaUser, UserRole as PrismaUserRole } from '~/generated/prisma'; // UserRoleもインポート

export type JwtPayload = {
  sub: string; // userId
  email: string;
  name?: string | null; // NestJSのAuthServiceのpayloadに合わせてnameも追加
  // 他に必要な情報があれば追加 (例: role)
};

export type LoginResponse = {
  accessToken: string;
};

// PrismaUserからパスワードを除外した型
export type SafeUser = Omit<PrismaUser, 'password'>;

// MeEntity に相当する型 (id, email, name を持つ)
export type MeResponseType = {
  id: string;
  email: string;
  name: string | null; // PrismaのUserモデルではnameはnullableなので合わせる
  userRole: PrismaUserRole; // userRoleも返すようにする
};


// HonoのContext型を拡張して、認証ミドルウェアでセットするuser情報を持たせる
declare module 'hono' {
  interface ContextVariableMap {
    user?: JwtPayload; // 認証ミドルウェアでセットするユーザー情報
  }
}
