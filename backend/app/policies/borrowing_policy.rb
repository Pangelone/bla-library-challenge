class BorrowingPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def create?
    user&.member?
  end

  def return_book?
    librarian?
  end
end
