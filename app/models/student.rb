class Student < ApplicationRecord
  has_many :lane_assignments
  has_many :races, through: :lane_assignments
  has_many :race_results
end
