import jwt from "jsonwebtoken";

export class AuthService {
  private readonly secret = "your-secret-key"; // 必ず環境変数で管理すること

  generateToken(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: "1h" });
  }

  verifyToken(token: string): jwt.JwtPayload | string | null {
    try {
      return jwt.verify(token, this.secret);
    } catch {
      return null;
    }
  }
}
