using System;
using System.Linq;
using System.Text.RegularExpressions;

namespace Library.WebApi.Helpers
{
    /// <summary>
    /// Helper for work with ISBN.
    /// </summary>
    public class IsbnHelper
    {
        /// <summary>
        /// Determines ISBN is valid.
        /// </summary>
        /// <param name="isbn">The isbn.</param>
        /// <returns>
        ///   <c>true</c> if ISBN is valid; otherwise, <c>false</c>.
        /// </returns>
        public static bool IsValidIsbn(string isbn)
        {
            if (string.IsNullOrWhiteSpace(isbn))
            {
                return true;
            }

            bool result = false;
            isbn = isbn.Replace("-", "").Replace(" ", "");

            if (isbn.Length == 10)
            {
                result = IsValidIsbn10(isbn);
            }
            else if (isbn.Length == 13)
            {
                result = IsValidIsbn13(isbn);
            }

            return result;
        }

        // converting char code to its symbol meaning integer
        private static int CharCodeToSymbolInteger(char c)
        {
            return c - '0';
        }

        private static bool IsOddNumber(int number)
        {
            return number % 2 != 0;
        }

        private static bool IsValidIsbn10(string isbn)
        {
            bool result = false;

            // isbn10 string have 10 chars.
            // First 9 chars should be numbers and the 10th char can be a number or an 'X'
            if (Regex.IsMatch(isbn, @"^\d{9}[\d,X]{1}$"))
            {
                /*
                * result = (isbn[0] * 1 + isbn[1] * 2 + isbn[2] * 3 + isbn[3] * 4 + ... + isbn[9] * 10) mod 11 == 0
                */
                int sum = 0;

                for (int i = 0; i < 9; i++)
                {
                    sum += CharCodeToSymbolInteger(isbn[i]) * (i + 1);
                }

                sum += (isbn[9] == 'X' ? 10 : CharCodeToSymbolInteger(isbn[9])) * 10;

                result = sum % 11 == 0;
            }

            return result;
        }

        private static bool IsValidIsbn13(string isbn)
        {
            bool result = false;

            // isbn13 string have 13 chars. All of them should be numbers.
            if (Regex.IsMatch(isbn, @"^\d{13}$"))
            {
                /*
                * result = (isbn[0] * 1 + isbn[1] * 3 + isbn[2] * 1 + isbn[3] * 3 + ... + isbn[12] * 1) mod 10 == 0
                */
                int index = 0;
                int sum = isbn.Sum(c => CharCodeToSymbolInteger(c) * (IsOddNumber(index++) ? 3 : 1));

                result = sum % 10 == 0;
            }

            return result;
        }
    }
}
