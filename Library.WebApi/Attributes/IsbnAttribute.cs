using System;
using System.ComponentModel.DataAnnotations;
using Library.WebApi.Helpers;

namespace Library.WebApi.Attributes
{
    /// <summary>
    /// Attribute for validation an ISBN.
    /// </summary>
    /// <seealso cref="System.ComponentModel.DataAnnotations.ValidationAttribute"/>
    public class IsbnAttribute : ValidationAttribute
    {
        /// <summary>
        /// Returns true if ISBN is valid.
        /// </summary>
        /// <param name="value">The value of the object to validate.</param>
        /// <returns>
        /// true if the specified value is valid; otherwise, false.
        /// </returns>
        public override bool IsValid(object value)
        {
            return IsbnHelper.IsValidIsbn(value?.ToString());
        }
    }
}
