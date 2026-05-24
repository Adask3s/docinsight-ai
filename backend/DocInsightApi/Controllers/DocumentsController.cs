using DocInsightApi.Data;
using DocInsightApi.DTOs;
using DocInsightApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace DocInsightApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize] // każdy endpoint wymaga uwierzytelnienia
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public DocumentsController(ApplicationDbContext db)
        {
            _db = db;
        }

        // GET /documents - lista dokumentów
        [HttpGet]
        public IActionResult GetDocuments()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // <-- pobierz UserId z tokena
            var docs = _db.Documents
                .Where(d => d.UserId == userId) // <-- tylko dokumenty tego usera
                .OrderByDescending(d => d.UploadedAt)
                .Select(d => new { d.Id, d.FileName, d.UploadedAt })
                .ToList();

            return Ok(docs);
        }

        // GET /documents/{id} - szczegóły dokumentu
        [HttpGet("{id}")]
        public IActionResult GetDocument(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var doc = _db.Documents.FirstOrDefault(d => d.Id == id && d.UserId == userId);
            if (doc == null) return NotFound();

            return Ok(new
            {
                doc.Id,
                doc.FileName,
                doc.UploadedAt,
                summary = string.IsNullOrEmpty(doc.SummaryJson) ? null
                          : JsonSerializer.Deserialize<object>(doc.SummaryJson),
                classification = string.IsNullOrEmpty(doc.ClassificationJson) ? null
                                : JsonSerializer.Deserialize<object>(doc.ClassificationJson),
                risk = string.IsNullOrEmpty(doc.RiskJson) ? null
                       : JsonSerializer.Deserialize<object>(doc.RiskJson)
            });
        }

        // POST /documents/save - zapis analizy
        [HttpPost("save")]
        public async Task<IActionResult> SaveDocument([FromBody] SaveDocumentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // sprawdzenie pełnej analizy
            if (dto.Summary == null || dto.Classification == null || dto.Risk == null)
            {
                return BadRequest("❌ Potrzebujesz kompletnej analizy, aby zapisać dokument do historii.");
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var document = new Document
            {
                FileName = dto.FileName,
                UploadedAt = DateTime.UtcNow,
                SummaryJson = JsonSerializer.Serialize(dto.Summary),
                ClassificationJson = JsonSerializer.Serialize(dto.Classification),
                RiskJson = JsonSerializer.Serialize(dto.Risk),
                UserId = userId // <-- przypisz dokument do usera!
            };

            _db.Documents.Add(document);
            await _db.SaveChangesAsync();

            return Ok(new { message = "✅ Dokument został zapisany w historii." });
        }

        // DELETE /documents/{id} - usuń dokument użytkownika
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            // Pobieramy UserId z tokena JWT (zalogowany użytkownik)
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Szukamy dokumentu o danym id należącego do danego użytkownika
            var doc = _db.Documents.FirstOrDefault(d => d.Id == id && d.UserId == userId);

            // Jeśli nie znaleziono dokumentu, zwracamy 404
            if (doc == null)
                return NotFound(new { message = "Nie znaleziono dokumentu lub nie masz uprawnień." });

            // Usuwamy dokument z bazy i zapisujemy zmiany
            _db.Documents.Remove(doc);
            await _db.SaveChangesAsync();

            return Ok(new { message = "✅ Dokument usunięty z historii." });
        }
    }

}
