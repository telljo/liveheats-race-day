# frozen_string_literal: true

module Races
  module ValidateLaneAssignments
    def self.call(assignments)
      assignments = assignments&.compact
      errors = []

      if assignments.empty?
        errors << "At least #{Race::MIN_STUDENTS} students are required."
        return errors
      end

      if assignments.length < Race::MIN_STUDENTS
        errors << "At least #{Race::MIN_STUDENTS} students are required."
        return errors
      end

      lane_numbers = assignments.map { |a| a[:lane_number] }
      student_ids  = assignments.map { |a| a[:student_id] }

      unless lane_numbers.all? { |n| n.is_a?(Integer) && n.positive? }
        errors << "Lane numbers must be positive integers."
        return errors
      end

      if lane_numbers.uniq.length != lane_numbers.length
        errors << "Different students cannot be assigned to the same lane."
        return errors
      end

      if student_ids.any?(&:nil?) || student_ids.any? { |id| id.to_s.strip.empty? }
        errors << "Each lane must have a student."
        return errors
      end

      if student_ids.compact.uniq.length != student_ids.compact.length
        errors << "The same student cannot be assigned to more than one lane."
        return errors
      end

      errors
    end
  end
end
