import { InMemoryStatementsRepository } from "../../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "../../../modules/statements/useCases/getBalance/GetBalanceError";
import { GetBalanceUseCase } from "../../../modules/statements/useCases/getBalance/GetBalanceUseCase";
import { InMemoryUsersRepository } from "../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../modules/users/useCases/createUser/CreateUserUseCase";

describe("Get Balance Use Case", () => {
  let userRepositoryInMemory: InMemoryUsersRepository;
  let statementRepositoryInMemory: InMemoryStatementsRepository;
  let createUserUseCase: CreateUserUseCase;
  let getBalanceUseCase: GetBalanceUseCase;

  const validUser = {
    name: "test",
    email: "test@test.com",
    password: "1234",
  };
  enum OperationType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
  }

  beforeAll(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
    getBalanceUseCase = new GetBalanceUseCase(
      statementRepositoryInMemory,
      userRepositoryInMemory
    );
  });


  test("Should be able to get a user's balance", async () => {
    const user = await createUserUseCase.execute(validUser);
    const deposito = {
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 10,
      description: "Teste de deposito",
    };
    const statementOperation = await statementRepositoryInMemory.create(deposito);

    const balance = await getBalanceUseCase.execute({
      user_id: String(user.id),
    });

    expect(balance.balance).toBe(deposito.amount);
    expect(balance.statement).toContain(statementOperation);
  });

  test("should not be able get a balance for non user", async () => {
    await expect(getBalanceUseCase.execute({user_id:"non-user-id"})).rejects.toBeInstanceOf(GetBalanceError)
  });
});
