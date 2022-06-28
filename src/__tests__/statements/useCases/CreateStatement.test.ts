import { InMemoryStatementsRepository } from "../../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "../../../modules/statements/useCases/createStatement/CreateStatementError";
import { CreateStatementUseCase } from "../../../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { InMemoryUsersRepository } from "../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../modules/users/useCases/createUser/CreateUserUseCase";

describe("Create a statement Use Case", () => {
  let statementsRepository: InMemoryStatementsRepository;
  let createStatementUseCase: CreateStatementUseCase;
  let createUserUseCase: CreateUserUseCase;
  let userRepository: InMemoryUsersRepository;

  const validUser = {
    name: "",
    email: "",
    password: "",
  };

  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  beforeAll(() => {
    userRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
    createStatementUseCase = new CreateStatementUseCase(
      userRepository,
      statementsRepository
    );
  });

  beforeEach(() => {
    Object.assign(validUser, {
      name: String(Math.random() * 10000),
      email: String(Math.random() * 10000),
      password: String(Math.random() * 10000),
    });
  });

  test("should be able create a new statement for a valid user", async () => {
    const user = await createUserUseCase.execute(validUser);
    const deposito = {
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 10,
      description: "Teste de deposito",
    }
    const statementOperation = await createStatementUseCase.execute(deposito);
    expect(statementOperation).toMatchObject(deposito)
  });

  test("should not be able to create a statement for a non existing user", async () => {
    const deposito = {
      user_id: "invalid-user-id",
      type: OperationType.DEPOSIT,
      amount: 10,
      description: "Teste de deposito",
    }

    await expect(createStatementUseCase.execute(deposito)).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  test("Should be not able to withdraw an amount if don't enough balance", async () => {
    const user = await createUserUseCase.execute(validUser);

    const deposito = {
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 10,
      description: "Teste de deposito",
    };

    const retirada = {
      user_id: String(user.id),
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Teste de retirada",
    }
    await createStatementUseCase.execute(deposito);
    await expect(createStatementUseCase.execute(retirada)).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });
});
