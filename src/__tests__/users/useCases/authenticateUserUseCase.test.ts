import { verify } from "jsonwebtoken";
import auth from "../../../config/auth";
import { InMemoryUsersRepository } from "../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "../../../modules/users/useCases/authenticateUser/IncorrectEmailOrPasswordError";
import { CreateUserUseCase } from "../../../modules/users/useCases/createUser/CreateUserUseCase";

describe("Authenticate user", () => {
  let userRepository: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;
  let authenticateUserUserCase: AuthenticateUserUseCase;
  let validUser = {
    name: "userTest",
    email: "userTest@test.com",
    password: "1234",
  };

  beforeAll(() => {
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
    authenticateUserUserCase = new AuthenticateUserUseCase(userRepository);
  });

  test("Should be able to authenticate a user", async () => {
    const createdUser = await createUserUseCase.execute(validUser);
    const { user, token } = await authenticateUserUserCase.execute({
      email: validUser.email,
      password: validUser.password,
    });

    const tokenUser = verify(token, auth.jwt.secret);

    expect(createdUser).toMatchObject(user);
    expect((<any>tokenUser).sub).toBe(createdUser.id);
    expect((<any>tokenUser).user).toMatchObject(user);
  });

  test("Should not be able to authenticate a non existing user", async () => {
    await expect(
      authenticateUserUserCase.execute({
        email: "invalid-email",
        password: "invalid-passwor",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  test("Should be able to authenticate a user", async () => {
    const createdUser = await createUserUseCase.execute({
      name: "userTest2",
      email: "userTest2@test.com",
      password: "1234",
    });

    await expect(
      authenticateUserUserCase.execute({
        email: createdUser.email,
        password: "invalid pass",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
