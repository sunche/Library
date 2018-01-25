using System;
using Library.WebApi.Helpers;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Library.WebApi.Tests
{
    [TestClass]
    public class IsbnHelperTests

    {
        [TestMethod]
        public void Right13DigitalIsbn_Valid()
        {
            Assert.IsTrue(IsbnHelper.IsValidIsbn("978 - 1420955095"));
            Assert.IsTrue(IsbnHelper.IsValidIsbn("978-3-16-148410-0"));
            
        }

        [TestMethod]
        public void Right10DigitalIsbn_Valid()
        {
            Assert.IsTrue(IsbnHelper.IsValidIsbn("0-684-84328-5"));
            Assert.IsTrue(IsbnHelper.IsValidIsbn("0-9752298-0-X"));
        }

        [TestMethod]
        public void WrongIsbn_Invalid()
        {
            Assert.IsFalse(IsbnHelper.IsValidIsbn("978 - 1"));
            Assert.IsFalse(IsbnHelper.IsValidIsbn("0-684-8432-5"));
            Assert.IsFalse(IsbnHelper.IsValidIsbn("0-9752298-G-X"));
        }
    }
}
