import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../app";
import { ProfileMap } from "../../../modules/users/mappers/ProfileMap";
import user from "../../Fixture/User";


describe("User Profile Controller", () => {

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


  test("get user profile", async () => {

    await req.post('/api/v1/users').send(user);

    const tokenUser = await req.post('/api/v1/sessions').send({ email: user.email, password: user.password });

    const response = await req.get('/api/v1/profile').set('Authorization',`bearer ${tokenUser.body.token}`).send();

    expect(response.body).toHaveProperty('id');
    expect(response.body).toMatchObject({ email: user.email, name: user.name });
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');

  })
})
