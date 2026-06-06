# frozen_string_literal: true

module Api
  module V1
    class BorrowingsController < ApplicationController
      include Authenticatable

      before_action :set_borrowing, only: [:return_book]

      def index
        authorize Borrowing
        scope = current_user.librarian? ? Borrowing.all : current_user.borrowings
        borrowings = scope.includes(:book, :user).order(created_at: :desc)
        render json: borrowings, status: :ok
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
        @borrowing = Borrowing.find(params[:id])
      end
    end
  end
end
