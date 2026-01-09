# frozen_string_literal: true

module Races
  module ValidateRaceResults
    def self.call(results)
      race_results = results.compact
      errors = []

      if race_results.empty?
        errors << "At least #{Race::MIN_STUDENTS} students are required."
        return errors
      end

      if race_results.length < Race::MIN_STUDENTS
        errors << "At least #{Race::MIN_STUDENTS} students are required."
        return errors
      end

      places = race_results.map { |a| a[:place] }

      unless places.all? { |p| p.is_a?(Integer) && p.positive? }
        errors << "Places must be positive integers."
        return errors
      end

      counts = places.tally
      distinct = counts.keys.sort

      unless distinct.first == 1
        errors << "Places must start at 1."
        return errors
      end

      distinct.each_with_index do |p, idx|
        next_place = distinct[idx + 1]
        expected_next = p + counts[p]

        # no next place to check so everything is valid
        break if next_place.nil?

        # check that the next distinct place is correct
        unless next_place == expected_next
          errors << "Places must follow competition ranking (e.g. 1,1,3 or 1,2,2,4)."
          return errors
        end
      end

      errors
    end
  end
end
