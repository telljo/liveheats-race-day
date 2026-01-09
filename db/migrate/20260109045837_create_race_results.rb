class CreateRaceResults < ActiveRecord::Migration[8.0]
  def change
    create_table :race_results do |t|
      t.references :race, null: false, foreign_key: true
      t.references :student, null: false, foreign_key: true
      t.integer :place, null: false

      t.timestamps
    end

    add_index :race_results, [ :race_id, :student_id ], unique: true
  end
end
