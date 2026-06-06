# frozen_string_literal: true

module Api
  module V1
    class BooksController < ApplicationController
      include Authenticatable

      before_action :set_book, only: [:show, :update, :destroy]

      def index
        authorize Book
        books = Book.search(params[:q]).with_availability_counts.order(:title)
        active_loan_book_ids = member_active_loan_book_ids

        render json: books.map { |book| book_json(book, active_loan_book_ids) }, status: :ok
      end

      def show
        authorize @book
        render json: @book, status: :ok
      end

      def create
        book = Book.new(book_params)
        authorize book

        if book.save
          render json: book, status: :created
        else
          render_errors(book)
        end
      end

      def update
        authorize @book

        if @book.update(book_params)
          render json: @book, status: :ok
        else
          render_errors(@book)
        end
      end

      def destroy
        authorize @book
        @book.destroy
        head :no_content
      end

      private

      def set_book
        @book = Book.find(params[:id])
      end

      def book_params
        params.require(:book).permit(:title, :author, :genre, :isbn, :total_copies)
      end

      def member_active_loan_book_ids
        return [] unless current_user.member?

        current_user.borrowings.active.pluck(:book_id)
      end

      def book_json(book, active_loan_book_ids = [])
        book.as_json.merge(
          user_has_active_loan: active_loan_book_ids.include?(book.id)
        )
      end
    end
  end
end
