# frozen_string_literal: true

require "rails_helper"

RSpec.describe Races::ValidateLaneAssignments do
  subject(:errors) { described_class.call(assignments) }

  let(:s1) { create(:student) }
  let(:s2) { create(:student) }
  let(:s3) { create(:student) }

  context "when lane assignments are nil/empty" do
    let(:assignments) { {} }

    it "requires at least MIN_STUDENTS students" do
      expect(errors).to include("At least #{Race::MIN_STUDENTS} students are required.")
    end
  end

  context "when there are fewer than MIN_STUDENTS" do
    let(:assignments) { [ { lane_number: 1, student_id: s1.id } ] }

    it "requires at least MIN_STUDENTS students" do
      expect(errors).to include("At least #{Race::MIN_STUDENTS} students are required.")
    end
  end

  context "when lane numbers are invalid" do
    context "when a lane number is nil" do
      let(:assignments) do
        [
          { lane_number: nil, student_id: s1.id },
          { lane_number: 2, student_id: s2.id }
        ]
      end

      it "adds an error" do
        expect(errors).to include("Lane numbers must be positive integers.")
      end
    end

    context "when a lane number is zero" do
      let(:assignments) do
        [
          { lane_number: 0, student_id: s1.id },
          { lane_number: 2, student_id: s2.id }
        ]
      end

      it "adds an error" do
        expect(errors).to include("Lane numbers must be positive integers.")
      end
    end

    context "when a lane number is negative" do
      let(:assignments) do
        [
          { lane_number: -1, student_id: s1.id },
          { lane_number: 2, student_id: s2.id }
        ]
      end

      it "adds an error" do
        expect(errors).to include("Lane numbers must be positive integers.")
      end
    end

    context "when a lane number is not an integer" do
      let(:assignments) do
        [
          { lane_number: "1", student_id: s1.id },
          { lane_number: 2, student_id: s2.id }
        ]
      end

      it "adds an error" do
        expect(errors).to include("Lane numbers must be positive integers.")
      end
    end
  end

  context "when lane numbers are duplicated" do
    let(:assignments) do
      [
        { lane_number: 1, student_id: s1.id },
        { lane_number: 1, student_id: s2.id }
      ]
    end

    it "adds an error" do
      expect(errors).to include("Different students cannot be assigned to the same lane.")
    end
  end

  context "when a lane is missing a student" do
    context "when student_id is nil" do
      let(:assignments) do
        [
          { lane_number: 1, student_id: nil },
          { lane_number: 2, student_id: s2.id }
        ]
      end

      it "adds an error" do
        expect(errors).to include("Each lane must have a student.")
      end
    end

    context "when student_id is blank" do
      let(:assignments) do
        [
          { lane_number: 1, student_id: " " },
          { lane_number: 2, student_id: s2.id }
        ]
      end

      it "adds an error" do
        expect(errors).to include("Each lane must have a student.")
      end
    end
  end

  context "when the same student is assigned to multiple lanes" do
    let(:assignments) do
      [
        { lane_number: 1, student_id: s1.id },
        { lane_number: 2, student_id: s1.id }
      ]
    end

    it "adds an error" do
      expect(errors).to include("The same student cannot be assigned to more than one lane.")
    end
  end

  context "when assignments are valid" do
    let(:assignments) do
      [
        { lane_number: 1, student_id: s1.id },
        { lane_number: 2, student_id: s2.id },
        { lane_number: 3, student_id: s3.id }
      ]
    end

    it "returns no errors" do
      expect(errors).to eq([])
    end
  end

  context "when assignments include nil entries" do
    let(:assignments) do
      [
        { lane_number: 1, student_id: s1.id },
        nil,
        { lane_number: 2, student_id: s2.id }
      ]
    end

    it "ignores nil entries and returns no errors" do
      expect(errors).to eq([])
    end
  end
end
