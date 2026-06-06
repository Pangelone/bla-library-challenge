class User < ApplicationRecord
  has_secure_password

  # librarian = staff, member = can borrow. Keep it as enum so Pundit stays readable.
  enum role: { member: 0, librarian: 1 }

  has_many :borrowings, dependent: :destroy
  has_many :borrowed_books, through: :borrowings, source: :book

  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :name, presence: true
  validates :role, presence: true

  before_validation :normalize_email

  # Used by JWT and API responses - keep it explicit, no magic
  def librarian?
    role == "librarian"
  end

  def member?
    role == "member"
  end

  def as_json(options = {})
    super(options.merge(only: [:id, :email, :name, :role]))
  end

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end
end
