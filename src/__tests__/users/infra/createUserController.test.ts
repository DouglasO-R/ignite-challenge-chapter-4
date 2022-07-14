import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../app";
import user from "../../Fixture/User";


describe("Route user test", () => {
  let connection: Connection;
  const req = request(app);

  beforeAll(async()=>{
    connection = await createConnection();
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });


  test("create a user", async () => {
    const response = await req.post('/api/v1/users').send(user);

    expect(response.status).toBe(201);
  })
})
