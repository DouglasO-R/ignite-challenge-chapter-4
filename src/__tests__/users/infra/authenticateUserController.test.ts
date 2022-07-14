import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { validate } from "uuid";
import { verify } from "jsonwebtoken";

import { app } from "../../../app";
import user from "../../Fixture/User";
import { compare } from "bcryptjs";

interface TokenInterface {
  user: {
    id: string;
    name: string;
    email: string;
    password: string;
    created_at: string;
    updated_at: string;
  }
}

describe("User Authenticate controller", () => {
  let connection: Connection;
  const req = request(app);

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  test("auth user", async () => {
    await req.post('/api/v1/users').send(user);
    const response = await req.post('/api/v1/sessions').send({ email: user.email, password: user.password });

    const  decodedUser = verify(response.body.token, String(process.env.JWT_SECRET));

    expect(validate(response.body.user.id)).toBeTruthy();
    expect(response.body.user).toMatchObject({ email: user.email, name: user.name });

    expect((<any>decodedUser).user).toMatchObject(response.body.user);
    expect(compare(user.password,(decodedUser as TokenInterface).user.password)).toBeTruthy();
  });
})
