import { compareSync } from "bcryptjs";
import { validate } from "uuid";
import { InMemoryUsersRepository } from "../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "../../../modules/users/useCases/createUser/CreateUserError";
import { CreateUserUseCase } from "../../../modules/users/useCases/createUser/CreateUserUseCase";

describe("Create user use case", () => {
  let createUserUseCase: CreateUserUseCase;
  let userRepository: InMemoryUsersRepository;
  const validUser = {
    name: "test",
    email: "test@test.com",
    password: "1234",
  };

  beforeAll(() => {
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
  });

  test("should be able to create a new", async () => {
    const user = await createUserUseCase.execute(validUser);

    expect(user).toHaveProperty("id");
    expect(validate(String(user.id))).toBeTruthy();
    expect(user.name).toBe(validUser.name);
    expect(user.email).toBe(validUser.email);
    expect(compareSync(validUser.password, user.password)).toBeTruthy();
  });

  test("Should not be able to create a new user if it already exists", async () => {
    await expect(createUserUseCase.execute(validUser)).rejects.toBeInstanceOf(
      CreateUserError
    );
  });
});
