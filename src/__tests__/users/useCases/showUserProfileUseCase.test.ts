import { InMemoryUsersRepository } from "../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../modules/users/useCases/createUser/CreateUserUseCase";
import { ShowUserProfileError } from "../../../modules/users/useCases/showUserProfile/ShowUserProfileError";
import { ShowUserProfileUseCase } from "../../../modules/users/useCases/showUserProfile/ShowUserProfileUseCase";

describe("Show user profile use case", () => {
  let showUserUseCase: ShowUserProfileUseCase;
  let createUserUseCase: CreateUserUseCase;
  let userRepository: InMemoryUsersRepository;

  beforeAll(() => {
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
    showUserUseCase = new ShowUserProfileUseCase(userRepository);
  });

  test("should be able to show user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "1234",
    });

    const userProfile = showUserUseCase.execute(String(user.id));
    expect(user).toMatchObject(userProfile);
  });

  test("Should not be able to show an non-existing user profile",async() =>{
    await expect(showUserUseCase.execute("non-exists-id")).rejects.toBeInstanceOf(ShowUserProfileError)
  })
});
