import { OperationType } from "../../../modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "../../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../../../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { TransferBetweenAccountsUseCase } from "../../../modules/statements/useCases/transferBetweenAccounts/TransferBetweenAccountsUseCase";
import { InMemoryUsersRepository } from "../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../modules/users/useCases/createUser/CreateUserUseCase";



describe('Transfer Between Accounts', () => {
  let statementsRepository: InMemoryStatementsRepository;
  let createStatementUseCase: CreateStatementUseCase;
  let createUserUseCase: CreateUserUseCase;
  let userRepository: InMemoryUsersRepository;
  let transferBetweenAccountsUseCase: TransferBetweenAccountsUseCase;

  const validUser = {
    name: "",
    email: "",
    password: "",
  };



  beforeAll(() => {
    userRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
    createStatementUseCase = new CreateStatementUseCase(
      userRepository,
      statementsRepository
    );
    transferBetweenAccountsUseCase = new TransferBetweenAccountsUseCase(
      userRepository,
      statementsRepository
    )
  });

  beforeEach(() => {
    Object.assign(validUser, {
      name: String(Math.random() * 10000),
      email: String(Math.random() * 10000),
      password: String(Math.random() * 10000),
    });
  });


  test('transfer', async () => {
    const senderUser = await createUserUseCase.execute(validUser);
    const receiveUser = await createUserUseCase.execute({
      name: "receiver",
      email: "rece@receiver.com",
      password: "123456"
    });


    const deposito = {
      user_id: String(senderUser.id),
      type: OperationType.DEPOSIT,
      amount: 250,
      description: "Teste de deposito",
    }

    const transfer = {
      sender_id: String(senderUser.id),
      user_id: String(receiveUser.id),
      type: OperationType.TRANSFER,
      amount: 100,
      description: "Teste de transfer",
    }

    await createStatementUseCase.execute(deposito);
    const transferOperation = await transferBetweenAccountsUseCase.execute(transfer);

    expect(transferOperation).toHaveProperty('id')
    expect(transferOperation.amount).toBe(100)
    expect(transferOperation.sender_id).toBe(senderUser.id)
    expect(transferOperation.user_id).toBe(receiveUser.id)
  })
})
