using DocInsightApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Net.Http.Headers;

namespace DocInsightApi.Controllers
{
    [ApiController]
    // ustawienie trasy /analyze, czyli endpointu, pod którym będzie dostępna ta klasa
    [Route("[controller]")]
    public class AnalyzeController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public AnalyzeController(HttpClient httpClient)
        {
            _httpClient = httpClient;
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
                // Serializujemy tekst do JSON-a
                var jsonPayload = $"{{\"text\": {System.Text.Json.JsonSerializer.Serialize(input.Text)} }}";
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                // Wysyłamy do mikroserwisu Python
                var response = await _httpClient.PostAsync("http://127.0.0.1:8000/analyze/summary", content);

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
                var jsonPayload = $"{{\"text\": {System.Text.Json.JsonSerializer.Serialize(input.Text)} }}";
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("http://127.0.0.1:8000/analyze/classification", content);

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
                var jsonPayload = $"{{\"text\": {System.Text.Json.JsonSerializer.Serialize(input.Text)} }}";
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("http://127.0.0.1:8000/analyze/risk", content);

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
