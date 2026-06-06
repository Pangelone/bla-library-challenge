class Borrowing < ApplicationRecord
  LOAN_PERIOD = 2.weeks

  belongs_to :user
  belongs_to :book

  validates :borrowed_at, :due_at, presence: true
  validate :returned_at_after_borrowed_at, if: -> { returned_at.present? }

  scope :active, -> { where(returned_at: nil) }
  scope :returned, -> { where.not(returned_at: nil) }
  scope :overdue, -> { active.where("due_at < ?", Time.current) }
  scope :due_today, -> { active.where(due_at: Time.current.beginning_of_day..Time.current.end_of_day) }

  before_validation :set_default_dates, on: :create

  def active?
    returned_at.nil?
  end

  def overdue?
    active? && due_at < Time.current
  end

  def as_json(options = {})
    super(options).merge(
      "overdue" => overdue?,
      "book" => book.as_json,
      "user" => user.as_json
    )
  end

  private

  def set_default_dates
    self.borrowed_at ||= Time.current
    self.due_at ||= borrowed_at + LOAN_PERIOD
  end

  def returned_at_after_borrowed_at
    return if returned_at >= borrowed_at

    errors.add(:returned_at, "must be after borrowed date")
  end
end
