import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";

type ITransferBetweenAccountsDTO = Pick<
  Statement,
  'user_id' | 'sender_id' | 'description' | 'amount'
>

@injectable()
export class TransferBetweenAccountsUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,
  ) { }

  async execute({ user_id, sender_id, description, amount, }: ITransferBetweenAccountsDTO) {
    const senderExists = await this.usersRepository.findById(sender_id)

    if (!senderExists) {
      throw new Error("Sender not found");
    }

    const receiverExists = await this.usersRepository.findById(user_id)


    if (!receiverExists) {

      throw new Error('Receiver not exist');
    }

    if (sender_id === user_id) {

      throw new Error('transfer need 2 different users');
    }

    const currentBalance = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
      with_statement: false,
    });

    if (currentBalance.balance < amount) {

      throw new Error("insufficient funds");
    }

    const transfer = await this.statementsRepository.create({
      user_id,
      sender_id,
      description,
      amount,
      type: OperationType.TRANSFER,
    })

    return transfer
  }
}
