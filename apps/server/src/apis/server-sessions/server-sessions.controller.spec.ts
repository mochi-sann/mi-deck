import { beforeEach, describe } from "node:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { ServersessionsController } from "./server-sessions.controller";

describe("ServersessionsController", () => {
  let controller: ServersessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServersessionsController],
    }).compile();

    controller = module.get<ServersessionsController>(ServersessionsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
