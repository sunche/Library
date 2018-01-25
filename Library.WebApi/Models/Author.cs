using System;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace Library.WebApi.Models
{
    /// <summary>
    /// Author.
    /// </summary>
    [DataContract(Name = "author")]
    public class Author
    {
        /// <summary>
        /// Gets or sets the name.
        /// </summary>
        [Required]
        [StringLength(20)]
        [DataMember(Name = "name")]
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the surname.
        /// </summary>
        [Required]
        [StringLength(20)]
        [DataMember(Name = "surname")]
        public string Surname { get; set; }
    }
}
