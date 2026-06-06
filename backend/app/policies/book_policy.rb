class BookPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    user.present?
  end

  def create?
    librarian?
  end

  def update?
    librarian?
  end

  def destroy?
    librarian?
  end
end
