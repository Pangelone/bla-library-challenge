# frozen_string_literal: true

module Api
  module V1
    class BorrowingsController < ApplicationController
      include Authenticatable

      before_action :set_borrowing, only: [:show, :update, :destroy, :return_book]

      def index
        authorize Borrowing
        borrowings = policy_scope(Borrowing).includes(:book, :user).order(created_at: :desc)
        render json: borrowings, status: :ok
      end

      def show
        authorize @borrowing
        render json: @borrowing, status: :ok
      end

      def create
        authorize Borrowing
        book = Book.find(params[:book_id])
        result = Borrowings::CreateService.new(user: current_user, book: book).call

        if result.success?
          render json: result.borrowing, status: :created
        else
          render json: { errors: result.errors }, status: :unprocessable_entity
        end
      end

      # Full REST update - librarian can adjust due date or set returned_at
      def update
        authorize @borrowing

        if @borrowing.update(borrowing_params)
          render json: @borrowing, status: :ok
        else
          render_errors(@borrowing)
        end
      end

      def destroy
        authorize @borrowing
        @borrowing.destroy
        head :no_content
      end

      # Convenience route kept for the UI - same end result as PATCH with returned_at
      def return_book
        authorize @borrowing, :return_book?
        result = Borrowings::ReturnService.new(borrowing: @borrowing).call

        if result.success?
          render json: result.borrowing, status: :ok
        else
          render json: { errors: result.errors }, status: :unprocessable_entity
        end
      end

      private

      def set_borrowing
        @borrowing = policy_scope(Borrowing).find(params[:id])
      end

      def borrowing_params
        params.require(:borrowing).permit(:due_at, :returned_at)
      end
    end
  end
end
