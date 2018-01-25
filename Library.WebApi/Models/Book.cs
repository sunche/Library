using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;
using Library.WebApi.Attributes;

namespace Library.WebApi.Models
{
    /// <summary>
    /// Book.
    /// </summary>
    [DataContract(Name = "book")]
    public class Book
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="Book"/> class.
        /// </summary>
        public Book()
        {
            Authors = new List<Author>();
        }

        [Required]
        [MinimumItems(1, ErrorMessage = "Book must have a author")]
        [DataMember(Name = "authors")]
        public ICollection<Author> Authors { get; set; }

        /// <summary>
        /// Gets or sets the identifier.
        /// </summary>
        [Required]
        [DataMember(Name = "id")]

        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets the image URI.
        /// </summary>
        [DataMember(Name = "imageUri")]
        public string ImageUri { get; set; }

        /// <summary>
        /// Gets or sets the isbn.
        /// </summary>
        [Isbn(ErrorMessage = "Invalid ISBN")]
        [DataMember(Name = "isbn")]
        public string Isbn { get; set; }

        /// <summary>
        /// Gets or sets the pages count.
        /// </summary>
        [Required]
        [Range(1, 10000)]
        [DataMember(Name = "pagesCount")]
        public int PagesCount { get; set; }

        /// <summary>
        /// Gets or sets the publisher.
        /// </summary>
        [StringLength(30)]
        [DataMember(Name = "publisher")]
        public string Publisher { get; set; }

        /// <summary>
        /// Gets or sets the publish year.
        /// </summary>
        [Range(1800, int.MaxValue)]
        [DataMember(Name = "publishYear")]
        public int? PublishYear { get; set; }

        /// <summary>
        /// Gets or sets the book's title.
        /// </summary>
        [Required]
        [StringLength(30)]
        [DataMember(Name = "title")]
        public string Title { get; set; }
    }
}
