import { Test, type TestingModule } from "@nestjs/testing";
import { ServerSessionsService } from "./server-sessions.service";

describe("ServerSessionsService", () => {
  let service: ServerSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServerSessionsService],
    }).compile();

    service = module.get<ServerSessionsService>(ServerSessionsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
