using DocInsightApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Net.Http.Headers;
using System.Net.Http.Json; // Dodano, aby móc korzystać z czystej metody PostAsJsonAsync

namespace DocInsightApi.Controllers
{
    [ApiController]
    // ustawienie trasy /analyze, czyli endpointu, pod którym będzie dostępna ta klasa
    [Route("[controller]")]
    public class AnalyzeController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config; // Dodano, aby mieć dostęp do appsettings.json

        // Wstrzykujemy IConfiguration do konstruktora
        public AnalyzeController(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        // Endpoint: POST /analyze/summary
        // Wywołuje mikroserwis Python: /analyze/summary
        [HttpPost("summary")]
        public async Task<IActionResult> AnalyzeSummary([FromBody] DocumentTextInput input)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(input.Text))
                return BadRequest("Text is empty.");

            try
            {
                // Pobieramy bezpiecznie adres mikroserwisu z pliku konfiguracyjnego
                var pythonUrl = $"{_config["PythonMicroserviceUrl"]}/analyze/summary";

                // Serializujemy tekst do JSON-a
                // Teraz obiekt tworzy się w locie: 'new { text = input.Text }', a metoda zajmuje się resztą.
                
                // Wysyłamy do mikroserwisu Python
                var response = await _httpClient.PostAsJsonAsync(pythonUrl, new { text = input.Text });

                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, "Analyzing microservice error (summary).");

                var responseBody = await response.Content.ReadAsStringAsync();
                return Content(responseBody, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error (summary): {ex.Message}");
            }
        }

        // Endpoint: POST /analyze/classification
        // Wywołuje mikroserwis Python: /analyze/classification
        [HttpPost("classification")]
        public async Task<IActionResult> AnalyzeClassification([FromBody] DocumentTextInput input)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(input.Text))
                return BadRequest("Text is empty.");

            try
            {
                // Pobieramy bezpiecznie adres mikroserwisu
                var pythonUrl = $"{_config["PythonMicroserviceUrl"]}/analyze/classification";

                // Serializujemy tekst do JSON-a
                // Wysyłamy do mikroserwisu Python
                var response = await _httpClient.PostAsJsonAsync(pythonUrl, new { text = input.Text });

                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, "Analyzing microservice error (classification).");

                var responseBody = await response.Content.ReadAsStringAsync();
                return Content(responseBody, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error (classification): {ex.Message}");
            }
        }

        // Endpoint: POST /analyze/risk
        // Wywołuje mikroserwis Python: /analyze/risk
        [HttpPost("risk")]
        public async Task<IActionResult> AnalyzeRisk([FromBody] DocumentTextInput input)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(input.Text))
                return BadRequest("Text is empty.");

            try
            {
                // Pobieramy bezpiecznie adres mikroserwisu
                var pythonUrl = $"{_config["PythonMicroserviceUrl"]}/analyze/risk";

                // Serializujemy tekst do JSON-a
                // Wysyłamy do mikroserwisu Python
                var response = await _httpClient.PostAsJsonAsync(pythonUrl, new { text = input.Text });

                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, "Analyzing microservice error (risk).");

                var responseBody = await response.Content.ReadAsStringAsync();
                return Content(responseBody, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error (risk): {ex.Message}");
            }
        }
    }
}