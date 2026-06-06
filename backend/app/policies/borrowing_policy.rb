class BorrowingPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    user.present? && (librarian? || record.user_id == user.id)
  end

  def create?
    user&.member?
  end

  def update?
    librarian?
  end

  def destroy?
    librarian?
  end

  def return_book?
    librarian?
  end

  class Scope < Scope
    def resolve
      return scope.all if user.librarian?

      scope.where(user_id: user.id)
    end
  end
end
