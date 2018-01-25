using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using Library.WebApi.Models;
using Library.WebApi.Repositories;

namespace Library.WebApi.Controllers
{
    /// <summary>
    /// Library controller.
    /// </summary>
    /// <seealso cref="System.Web.Http.ApiController"/>
    [EnableCors("*", "*", "*")]
    public class LibraryController : ApiController
    {
        private readonly ILibraryRepository libraryRepository;

        public LibraryController(ILibraryRepository libraryRepository)
        {
            this.libraryRepository = libraryRepository;
        }

        // DELETE: api/Library/5
        public IHttpActionResult Delete(Guid id)
        {
            try
            {
                libraryRepository.Delete(id);
                return Ok();
            }
            catch (Exception e)
            {
                return InternalServerError(e);
            }
        }

        // GET: api/Library
        public IEnumerable<Book> Get()
        {
            return libraryRepository.GetAll();
        }

        // GET: api/Library/5
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/Library
        public IHttpActionResult Post([FromBody] Book book)
        {
            return ExecuteActionWithModelValidation(libraryRepository.Add, book);
        }

        // PUT: api/Library/5
        public IHttpActionResult Put([FromUri] Guid id, [FromBody] Book book)
        {
            return ExecuteActionWithModelValidation(libraryRepository.Update, book);
        }

        [HttpPost, Route("api/upload")]
        public async Task<IHttpActionResult> Upload()
        {
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            var provider = new MultipartMemoryStreamProvider();
            await Request.Content.ReadAsMultipartAsync(provider);
            foreach (var file in provider.Contents)
            {
                var filename = file.Headers.ContentDisposition.FileName.Trim('\"');
                var filePath = HttpContext.Current.Server.MapPath("~/Images/" + filename);
                byte[] buffer = await file.ReadAsByteArrayAsync();
                File.WriteAllBytes(filePath, buffer);
            }

            return Ok();
        }

        private IHttpActionResult ExecuteActionWithModelValidation(Action<Book> action, Book book)
        {
            if (book == null || !ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                action(book);
                return Ok();
            }
            catch (Exception e)
            {
                return InternalServerError(e);
            }
        }
    }
}
