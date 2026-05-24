using DocInsightApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;

namespace DocInsightApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        // Wstrzykujemy IConfiguration, by mieć dostęp do appsettings.json
        public ChatController(IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _httpClient = httpClientFactory.CreateClient();
            _config = config;
        }

        [HttpPost]
        public async Task<IActionResult> ChatWithDocument([FromBody] ChatRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Wyciągamy bezpiecznie link z konfiguracji
            var pythonUrl = $"{_config["PythonMicroserviceUrl"]}/chat";

            var payload = new
            {
                text = request.Text,
                question = request.Question
            };

            // Zamiast "StringContent" i serializacji, używamy wbudowanej metody PostAsJsonAsync, która robi to za nas
            var response = await _httpClient.PostAsJsonAsync(pythonUrl, payload);
            var responseBody = await response.Content.ReadAsStringAsync();

            return Content(responseBody, "application/json");
        }
    }
}