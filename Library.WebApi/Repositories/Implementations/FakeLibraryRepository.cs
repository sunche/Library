using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Library.WebApi.Models;

namespace Library.WebApi.Repositories.Implementations
{
    /// <summary>
    /// implement fake ILibraryRepository.
    /// </summary>
    /// <seealso cref="Library.WebApi.Repositories.ILibraryRepository"/>
    public class FakeLibraryRepository : ILibraryRepository
    {
        private static readonly List<Book> books = new List<Book>()
        {
            new Book { Id = Guid.NewGuid(), Title = ".NET-Architecting Applications", PagesCount = 416, PublishYear = 2014, Publisher = "Microsoft Press", Isbn = "978-0735685352", Authors = new List<Author> { new Author { Name = "Dino", Surname = "Esposito" }, new Author { Name = "Andrea", Surname = "Saltarello" } }, ImageUri = "NetArchitecting.jpg" },
            new Book { Id = Guid.NewGuid(), Title = "Winnie-the-Pooh", PagesCount = 176, Isbn = "978-0525444435", PublishYear = 1988, Publisher = "Dutton Books for Young Readers", Authors = new List<Author> { new Author { Name = "Ernest", Surname = "Shepard" } } },
            new Book { Id = Guid.NewGuid(), Title = "CLR via C#", PagesCount = 896, PublishYear = 2012, Publisher = "Microsoft Press", Isbn = "978-0735667457", Authors = new List<Author> { new Author { Name = "Jeffrey", Surname = "Richter" } }, ImageUri = "csharp.jpg" },
            new Book { Id = Guid.NewGuid(), Title = "H.P. and the Sorcerer's Stone", PagesCount = 309, PublishYear = 1998, Publisher = "Scholastic", Isbn = "978-0439708180", Authors = new List<Author> { new Author { Name = "Joan", Surname = "Rowling" } }, ImageUri = "hpotter.jpg" },
        };

        /// <summary>
        /// Adds the specified book.
        /// </summary>
        /// <param name="book">The book.</param>
        public void Add(Book book)
        {
            books.Add(book);
        }

        /// <summary>
        /// Deletes the specified identifier.
        /// </summary>
        /// <param name="id">The identifier.</param>
        public async void Delete(Guid id)
        {
            books.RemoveAll(x => x.Id == id);
        }

        /// <summary>
        /// Gets all books.
        /// </summary>
        /// <returns>
        /// Books collection.
        /// </returns>
        public IEnumerable<Book> GetAll()
        {
            return books;
        }

        /// <summary>
        /// Updates the specified book.
        /// </summary>
        /// <param name="book">The book.</param>
        /// <exception cref="ObjectNotFoundException"></exception>
        public void Update(Book book)
        {
            var bookToUpdate = books.FirstOrDefault(x => x.Id == book.Id);
            if (bookToUpdate == null)
            {
                throw new ObjectNotFoundException();
            }

            books.Remove(bookToUpdate);
            books.Add(book);
        }
    }
}
