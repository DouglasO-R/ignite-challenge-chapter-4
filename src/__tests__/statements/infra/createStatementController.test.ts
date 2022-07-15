import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../app";
import user from "../../Fixture/User";


describe("Statement controller", () => {
  const req = request(app);
  let connection:Connection;
  let tokenUser:request.Response;
  let tokenTransferUser:request.Response;

  const deposit = {
    amount:250.00,
    description:"course"
  }

  const withdraw = {
    amount:100.00,
    description:"gas"
  }

  const transferUser ={
    name: "string",
    email: "string",
    password:'12345'
  }

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await req.post('/api/v1/users').send(user);
    await req.post('/api/v1/users').send(transferUser);

    tokenUser = await req.post('/api/v1/sessions').send({ email: user.email, password: user.password });
    tokenTransferUser = await req.post('/api/v1/sessions').send({ email: transferUser.email, password: transferUser.password });

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

  test("transfer", async () => {

    const response = await req.post(`/api/v1/statements/transfer/${tokenTransferUser.body.user.id}`).set('Authorization', `bearer ${tokenUser.body.token}`).send({
      amount:10,
      description:"test"
    });

    expect(response.status).toBe(201);


  });

  test('balance',async() =>{

    const response = await req.get('/api/v1/statements/balance').set('Authorization', `bearer ${tokenUser.body.token}`).send()

    expect(response.body).toHaveProperty('statement');
    expect(response.body.statement).toHaveLength(3);
    expect(response.body).toHaveProperty('balance',140);
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
