import { InMemoryStatementsRepository } from "../../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "../../../modules/statements/useCases/getStatementOperation/GetStatementOperationError";
import { GetStatementOperationUseCase } from "../../../modules/statements/useCases/getStatementOperation/GetStatementOperationUseCase";
import { InMemoryUsersRepository } from "../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../modules/users/useCases/createUser/CreateUserUseCase";

describe("Get Statement Operation",() =>{
  let userRepositoryInMemory: InMemoryUsersRepository;
  let statementRepositoryInMemory: InMemoryStatementsRepository;
  let createUserUseCase: CreateUserUseCase;
  let getStatementOperationUseCase: GetStatementOperationUseCase;

  const validUser = {
    name: "",
    email: "",
    password: "",
  };

  enum OperationType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
  }

  beforeAll(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
    getStatementOperationUseCase = new GetStatementOperationUseCase(userRepositoryInMemory,statementRepositoryInMemory);
  });

  beforeEach(() => {
    Object.assign(validUser, {
      name: String(Math.random() * 10000),
      email: String(Math.random() * 10000),
      password: String(Math.random() * 10000),
    });
  });


  test("Should be able to list a user's statement operation",async () =>{
    const user = await createUserUseCase.execute(validUser);
    const deposito = {
      user_id:String(user.id),
      description:"test deposito",
      amount:50,
      type:OperationType.DEPOSIT
    };

    const statement = await statementRepositoryInMemory.create(deposito);


    const statementOperation = await getStatementOperationUseCase.execute({
      user_id:String(user.id),
      statement_id:String(statement.id)
    });

    expect(statementOperation).toMatchObject(deposito);
  });

  test("Should not be able to list statement operation if user doesn't exists",async () =>{
    const user = await createUserUseCase.execute(validUser);
    const deposito = {
      user_id:String(user.id),
      description:"test deposito",
      amount:50,
      type:OperationType.DEPOSIT
    };

    const statement = await statementRepositoryInMemory.create(deposito);


    await expect(getStatementOperationUseCase.execute({
      user_id:"invalid-user",
      statement_id:String(statement.id)
    })).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  test("Should not be able to list statement operation if statement doesn't exists",async () =>{
    const user = await createUserUseCase.execute(validUser);


    await expect(getStatementOperationUseCase.execute({
      user_id:String(user.id),
      statement_id:"inavalid-statement"
    })).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
})
