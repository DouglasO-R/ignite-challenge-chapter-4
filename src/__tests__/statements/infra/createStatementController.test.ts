import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../app";
import user from "../../Fixture/User";


describe("Statement controller", () => {
  const req = request(app);
  let connection:Connection;
  let tokenUser:request.Response;

  const deposit = {
    amount:250.00,
    description:"course"
  }

  const withdraw = {
    amount:100.00,
    description:"gas"
  }

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await req.post('/api/v1/users').send(user);
    tokenUser = await req.post('/api/v1/sessions').send({ email: user.email, password: user.password });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  test("deposit", async () => {


    const response = await req.post('/api/v1/statements/deposit').set('Authorization', `bearer ${tokenUser.body.token}`).send(deposit);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');

    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('type','deposit');
    expect(response.body).toMatchObject(deposit);

  });

  test("withdraw", async () => {

    const response = await req.post('/api/v1/statements/withdraw').set('Authorization', `bearer ${tokenUser.body.token}`).send(withdraw);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('type','withdraw');
    expect(response.body).toMatchObject(withdraw);

  });

  test('balance',async() =>{

    const response = await req.get('/api/v1/statements/balance').set('Authorization', `bearer ${tokenUser.body.token}`).send()

    expect(response.body).toHaveProperty('statement');
    expect(response.body.statement).toHaveLength(2);
    expect(response.body).toHaveProperty('balance',150);
  })

  test('get statement by id',async() =>{

    const responseWithdraw = await req.post('/api/v1/statements/withdraw').set('Authorization', `bearer ${tokenUser.body.token}`).send(withdraw);
    const response = await req.get(`/api/v1/statements/${responseWithdraw.body.id}`).set('Authorization', `bearer ${tokenUser.body.token}`).send();


    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('description',withdraw.description);
    expect(response.body).toHaveProperty('amount',withdraw.amount.toFixed(2));
    expect(response.body).toHaveProperty('type','withdraw');
  })

})
