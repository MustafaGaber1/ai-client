import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

// Access the backend URL from the environment variables
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// Loader function for displaying dots while waiting for a response
function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// Function to type text into the message
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// Generate a unique ID for each message
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
}

// Function to create chat bubbles (user or bot)
function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && "ai"}">
        <div class="chat">
            <div class="profile">
                <img 
                  src=${isAi ? bot : user} 
                  alt="${isAi ? "bot" : "user"}" 
                />
            </div>
            <div class="message" id=${uniqueId}>${value}</div>
        </div>
    </div>
  `;
}

// Handle form submission to send the user's message to the backend
const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  // User's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  // Bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // Use the backend URL here (from environment variable)
  try {
    const response = await fetch(`${backendUrl}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: data.get("prompt") }),
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = "";

    if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim();
      typeText(messageDiv, parsedData);
    } else {
      const err = await response.text();
      messageDiv.innerHTML = "Something went wrong";
      alert(err);
    }
  } catch (error) {
    clearInterval(loadInterval);
    messageDiv.innerHTML = "Failed to connect to the server";
    alert("Failed to connect to the backend server.");
  }
};

// Add event listeners to handle form submission and pressing "Enter"
form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleSubmit(e);
  }
});
