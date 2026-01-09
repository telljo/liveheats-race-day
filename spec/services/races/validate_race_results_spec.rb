# frozen_string_literal: true

require "rails_helper"

RSpec.describe Races::ValidateRaceResults do
  subject(:errors) { described_class.call(results) }

  context "when race results are nil/empty" do
    let(:results) { {} }

    it "requires at least MIN_STUDENTS students" do
      expect(errors).to include("At least #{Race::MIN_STUDENTS} students are required.")
    end
  end

  context "when there are fewer than MIN_STUDENTS" do
    let(:results) { [ { place: 1 } ] }

    it "requires at least MIN_STUDENTS students" do
      expect(errors).to include("At least #{Race::MIN_STUDENTS} students are required.")
    end
  end

  context "when a place is zero" do
    let(:results) do
      [
        { place: 0 },
        { place: 1 }
      ]
    end

    it "adds an error" do
      expect(errors).to include("Places must be positive integers.")
    end
  end

  context "when a place is negative" do
    let(:results) do
      [
        { place: -1 },
        { place: 2 }
      ]
    end

    it "adds an error" do
      expect(errors).to include("Places must be positive integers.")
    end
  end

  context "when a place is not an integer" do
    let(:results) do
      [
        { place: "1" },
        { place: 2 }
      ]
    end

    it "adds an error" do
      expect(errors).to include("Places must be positive integers.")
    end
  end

  context "when places don't start at 1" do
    let(:results) do
      [
        { place: 2 },
        { place: 3 }
      ]
    end

    it "adds an error" do
      expect(errors).to include("Places must start at 1.")
    end
  end

  context 'when there is a tie and the next place is incorrect' do
    let(:results) do
      [
        { place: 1 },
        { place: 1 },
        { place: 2 }
      ]
    end

    it "adds an error" do
      expect(errors).to include("Places must follow competition ranking (e.g. 1,1,3 or 1,2,2,4).")
    end
  end

  context 'when there is a tie and the next place is correct' do
    let(:results) do
      [
        { place: 1 },
        { place: 1 },
        { place: 1 },
        { place: 4 }
      ]
    end

    it "returns no errors" do
      expect(errors).to eq([])
    end
  end
end
