using System;
using System.Collections.Generic;
using Library.WebApi.Models;

namespace Library.WebApi.Repositories
{
    /// <summary>
    /// Library Repo.
    /// </summary>
    public interface ILibraryRepository
    {
        /// <summary>
        /// Adds the specified book.
        /// </summary>
        /// <param name="book">The book.</param>
        void Add(Book book);

        /// <summary>
        /// Deletes the specified identifier.
        /// </summary>
        /// <param name="id">The identifier.</param>
        void Delete(Guid id);

        /// <summary>
        /// Gets all books.
        /// </summary>
        /// <returns>Books collection.</returns>
        IEnumerable<Book> GetAll();

        /// <summary>
        /// Updates the specified book.
        /// </summary>
        /// <param name="book">The book.</param>
        void Update(Book book);
    }
}
