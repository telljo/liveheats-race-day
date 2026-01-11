class Race < ApplicationRecord
  has_many :lane_assignments, dependent: :destroy
  has_many :students, through: :lane_assignments
  has_many :race_results, dependent: :destroy
  enum :status, { draft: 0, completed: 1 }

  accepts_nested_attributes_for :lane_assignments,
    reject_if: ->(attrs) { attrs["lane_number"].blank? || attrs["student_id"].blank? },
    allow_destroy: true

  accepts_nested_attributes_for :race_results,
    reject_if: ->(attrs) { attrs["place"].blank? || attrs["student_id"].blank? }

  validates :name, presence: true
  validate :lane_assignments_are_valid
  validate :race_results_are_valid, on: :complete

  MIN_STUDENTS = 2

  def complete!
    transaction do
      self.status = :completed
      save!(context: :complete)
    end
  end

  private

  def lane_assignments_are_valid
    lane_assignment_errors = Races::ValidateLaneAssignments.call(
      lane_assignments.reject(&:marked_for_destruction?).map do |la|
        {
          lane_number: la.lane_number,
          student_id: la.student_id
        }
      end
    )

    return if lane_assignment_errors.empty?

    lane_assignment_errors.each do |error|
      errors.add(:lane_assignments, error)
    end
  end

  def race_results_are_valid
    race_result_errors = Races::ValidateRaceResults.call(
      race_results.map do |rr|
        {
          place: rr.place
        }
      end
    )

    return if race_result_errors.empty?

    race_result_errors.each do |error|
      errors.add(:race_results, error)
    end
  end
end
