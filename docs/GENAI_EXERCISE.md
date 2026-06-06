# Task management API (supplementary design)

The BLA brief includes a second API exercise separate from the library domain. It is **backend-only** on purpose: the main submission already ships a React client for books and borrowings, and a duplicate task UI would repeat the same CRUD patterns without adding much new information.

## Why the brief is structured this way

| Constraint | Rationale |
|------------|-----------|
| API-only, no HTML views | Matches the library backend stack; the sample stays JSON endpoints only. |
| Nested `/api/v1/users/:user_id/tasks` | Forces tenant-style scoping — a flat `/tasks` index makes it easy to miss authorization bugs. |
| Reuse existing `User` + JWT | Auth is already implemented in the library app; the exercise focuses on Task CRUD and policies. |
| Request specs required | Same testing style as the library API so both halves of the submission stay consistent. |

No frontend is required for this section. The library React app covers the UI portion of the overall deliverable.

## Migration

```ruby
class CreateTasks < ActiveRecord::Migration[7.0]
  def change
    create_table :tasks do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.integer :status, null: false, default: 0
      t.date :due_date, null: false
      t.timestamps
    end

    add_index :tasks, [:user_id, :due_date]
  end
end
```

## Model

```ruby
# app/models/task.rb
class Task < ApplicationRecord
  belongs_to :user

  enum status: { pending: 0, in_progress: 1, done: 2 }

  validates :title, presence: true
  validates :status, presence: true
  validates :due_date, presence: true
  validate :due_date_not_in_past_on_create, on: :create

  scope :ordered, -> { order(due_date: :asc, created_at: :desc) }

  private

  def due_date_not_in_past_on_create
    return if due_date.blank? || due_date >= Date.current

    errors.add(:due_date, "cannot be in the past")
  end
end
```

## Controller

```ruby
# app/controllers/api/v1/tasks_controller.rb
module Api
  module V1
    class TasksController < ApplicationController
      before_action :set_task, only: [:show, :update, :destroy]

      def index
        render json: current_user.tasks.ordered
      end

      def create
        task = current_user.tasks.new(task_params)
        if task.save
          render json: task, status: :created
        else
          render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @task.update(task_params)
          render json: @task
        else
          render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @task.destroy
        head :no_content
      end

      private

      def set_task
        @task = current_user.tasks.find(params[:id])
      end

      def task_params
        params.require(:task).permit(:title, :description, :status, :due_date)
      end
    end
  end
end
```

## Routes snippet

```ruby
namespace :api do
  namespace :v1 do
    resources :users, only: [] do
      resources :tasks, only: [:index, :create, :show, :update, :destroy]
    end
  end
end
```

## Request specs (outline)

```ruby
# spec/requests/tasks_spec.rb — key cases
# - GET index → 200 with only current user's tasks; 401 without token
# - POST create with valid params → 201
# - PATCH/DELETE another user's task id → 404 via scoped find
# - POST with past due_date → 422
```

## Review checklist

1. Index uses `current_user.tasks`, never `Task.all`.
2. `set_task` scopes with `current_user.tasks.find(params[:id])` so foreign IDs return 404 instead of leaking existence.
3. Enum lives on the model; strong params permit `:status` consistently.
4. `due_date` validation on create rejects past dates.
5. Controller stays thin — validations and associations belong in the model.

## Scaling notes

- Paginate the index once volume grows (`pagy` or `kaminari`).
- Add `TaskPolicy` if rules grow beyond simple ownership (shared lists, admin overrides).
