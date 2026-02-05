using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
namespace DocInsightApi.Controllers;

[ApiController]

// dzięki routingowi .Net wie, że dla żądań HTTP przesłanych na dany adres (/Upload)
// ma wywołać metody w tej klasie (UploadController.cs)
[Route("[controller]")]
public class UploadController : ControllerBase
{
    private readonly HttpClient _httpClient;

    // Konstruktor z wstrzyknięciem zależności HttpClient
    public UploadController(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    [HttpPost]
    // tutaj trafi plik przesłany w POST przez React (fetch())
    public async Task<IActionResult> UploadPdf(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file has been sent.");

        // Tworzymy pojemnik na naszą zawartość do przesłania do mikroserwisu Pythona
        // (ten sam format, w jakim React wysyłał plik do .NET)
        using var content = new MultipartFormDataContent();

        // Otwiera plik jako strumień danych
        using var fileStream = file.OpenReadStream();

        // StreamContent - specjalny obiekt, który mówi HttpClientowi, że chcemy
        // przesłać dane z tego strumienia jako ciało HTTP (czyli zawartość pliku PDF)
        var streamContent = new StreamContent(fileStream);

        // Określa typ przesyłanego pliku
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);

        // Dodanie strumienia pod nazwą "file" do kontenera multipart
        content.Add(streamContent, "file", file.FileName);

        try
        {
            var response = await _httpClient.PostAsync("http://127.0.0.1:8000/parse", content);

            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Python parser error.");

            // Odpowiedź z mikroserwisu czytamy jako JSON
            var responseBody = await response.Content.ReadAsStringAsync();

            return Ok(responseBody); // frontend dostaje JSON z {"text": "..."}
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal error: {ex.Message}");
        }
    }
}
