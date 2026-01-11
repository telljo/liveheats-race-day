class Student < ApplicationRecord
  has_many :lane_assignments
  has_many :races, through: :lane_assignments
  has_many :race_results

  validates :first_name, presence: true
  validates :last_name, presence: true
end
