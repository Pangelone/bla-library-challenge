class DashboardPolicy < ApplicationPolicy
  def librarian?
    user&.librarian?
  end

  def member?
    user.present?
  end
end
