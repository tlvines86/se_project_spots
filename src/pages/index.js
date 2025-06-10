import logo from "../images/logo.svg";
import avatar from "../images/avatar.jpg";
import editicon from "../images/pencil.svg";
import plusicon from "../images/plus-icon.svg";
import "./index.css";
import {
  enableValidation,
  settings,
  disableButton,
} from "../scripts/validation.js";
import { setButtonText } from "../utils/helpers.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "5d4a544b-84d3-40e8-b3f2-c0eedd8c3d79",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, user]) => {
    profileName.textContent = user.name;
    profileDescription.textContent = user.about;
    if (user.avatar.includes("placeholder")) {
      avatarImg.src = avatar;
    } else {
      avatarImg.src = user.avatar;
    }
    cards.forEach((item) => {
      renderCard(item, "append");
    });
  })
  .catch(console.error);

const profileEditButton = document.querySelector(".profile__edit-btn");
const cardModalButton = document.querySelector(".profile__add-btn");
const avatarModalButton = document.querySelector(".profile__avatar-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const editModal = document.querySelector("#edit-modal");
const editFormElement = document.forms["edit-profile"];
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const modals = document.querySelectorAll(".modal");
const openedModal = document.querySelector(".modal_opened");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardSubmitBtn = cardModal.querySelector(".modal__save-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const cardModalClosePreview = previewModal.querySelector(
  ".modal__close-btn_image_preview"
);

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__save-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

const closeButtons = document.querySelectorAll(".modal__close-btn");
const cancelButton = document.querySelector(".modal__save-btn--cancel");

const logoImg = document.getElementById("logo");
const avatarImg = document.getElementById("avatar");
const editIconImg = document.getElementById("editicon");
const plusIconImg = document.getElementById("plusicon");

logoImg.src = logo;
editIconImg.src = editicon;
plusIconImg.src = plusicon;

let selectedCard, selectedCardId;

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }
  const deleteBtn = cardElement.querySelector(".card__delete-btn");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardLikeBtn.addEventListener("click", (evt) => handleLikeBtn(evt, data._id));

  deleteBtn.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalCaptionEl.textContent = data.name;
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
  });

  return cardElement;
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const avatarSubmitBtn = evt.submitter;
  setButtonText(avatarSubmitBtn, true, "Save", "Saving...");

  api
    .editAvatar({
      avatar: avatarInput.value,
    })
    .then((data) => {
      avatarImg.src = data.avatar;
      closeModal(avatarModal);
      cardForm.reset();
      disableButton(avatarSubmitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(avatarSubmitBtn, false, "Save", "Saving...");
    });
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Save", "Saving...");

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
      disableButton(cardSubmitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Save", "Saving...");
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();

  const deleteBtn = evt.submitter;
  setButtonText(deleteBtn, true, "Delete", "Deleting...");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(deleteBtn, false, "Delete", "Deleting...");
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const cardSubmitBtn = evt.submitter;
  setButtonText(cardSubmitBtn, true, "Save", "Saving...");

  api
    .addNewCard({
      name: cardNameInput.value,
      link: cardLinkInput.value,
    })
    .then((data) => {
      renderCard(data, "prepend");
      closeModal(cardModal);
      cardForm.reset();
      disableButton(cardSubmitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(cardSubmitBtn, false, "Save", "Saving...");
    });
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function renderCard(item, method = "prepend") {
  const cardElement = getCardElement(item);
  cardsList[method](cardElement);
}

function handleEscapeKey(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function handleLikeBtn(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-btn_liked");
  api
    .cardLikeStatus(id, isLiked)
    .then(evt.target.classList.toggle("card__like-btn_liked"))
    .catch(console.error);
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscapeKey);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.addEventListener("keydown", handleEscapeKey);
}

function handleOverlayClick(evt) {
  if (evt.target.classList.contains("modal")) {
    closeModal(evt.target);
  }
}

modals.forEach((modal) => {
  modal.addEventListener("mousedown", handleOverlayClick);
});

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  openModal(editModal);
});

cardModalButton.addEventListener("click", () => {
  openModal(cardModal);
});

avatarModalButton.addEventListener("click", () => {
  openModal(avatarModal);
});

document.addEventListener("keydown", handleEscapeKey);

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);
cancelButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

closeButtons.forEach((button) => {
  const popup = button.closest(".modal");
  button.addEventListener("click", () => closeModal(popup));
});

enableValidation(settings);
