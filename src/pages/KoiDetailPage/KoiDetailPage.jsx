import React, { useState } from "react";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import image from "../../assets/banner1.jpg";
import ex from "../../assets/koio_ex.png";
import usericon from "../../assets/icons/userIcon.png";
import "./KoiDetailPage.css";
import searchIcon from "../../assets/icons/searchIcon.svg";
import { Link, useNavigate } from "react-router-dom";
import { CardContent } from "@mui/material";
import { Typography } from "antd";
import api, { getFengShuiKoiFishPost } from "../../config/axios";
export default function KoiDetailPage() {
  return (
    <div
      style={{
        minHeight: "150vh",
        background: "#f6f4f3",
      }}
      className="homepage-container"
    >
      <AppHeader />
      <div className="container">
        <div className="container-ulti">asdfa</div>
        <div className="container-main-page">
        <div class="swiper room-swiper mt-5">
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div class="room-item position-relative bg-black rounded-4 overflow-hidden">
              <img src="images/room1.jpg" alt="img" class="post-image img-fluid rounded-4">
              <div class="product-description position-absolute p-5 text-start">
                <h4 class="display-6 fw-normal text-white">Grand deluxe rooms</h4>
                <p class="product-paragraph text-white">Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Molestiae at illum ipsum similique doloribus.</p>
                <table>
                  <tbody>
                    <tr class="text-white">
                      <td class="pe-2">Price:</td>
                      <td class="price">299$ /Pernight</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Size:</td>
                      <td>10 ft</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Capacity:</td>
                      <td>Max persion 2</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Bed:</td>
                      <td>Normal Beds</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Services:</td>
                      <td>Wifi, Television, Bathroom,...</td>
                    </tr>
                  </tbody>
                </table>
                <a href="index.html">
                  <p class="text-decoration-underline text-white m-0 mt-2">Browse Now</p>
                </a>
              </div>
            </div>
            <div class="room-content text-center mt-3">
              <h4 class="display-6 fw-normal"><a href="index.html">Grand deluxe rooms</a></h4>
              <p><span class="text-primary fs-4">$269</span>/night</p>
            </div>
          </div>
          <div class="swiper-slide">
            <div class="room-item position-relative bg-black rounded-4 overflow-hidden">
              <img src="images/room3.jpg" alt="img" class="post-image img-fluid rounded-4">
              <div class="product-description position-absolute p-5 text-start">
                <h4 class="display-6 fw-normal text-white">Sweet Family room</h4>
                <p class="product-paragraph text-white">Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Molestiae at illum ipsum similique doloribus.</p>
                <table>
                  <tbody>
                    <tr class="text-white">
                      <td class="pe-2">Price:</td>
                      <td class="price">299$ /Pernight</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Size:</td>
                      <td>10 ft</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Capacity:</td>
                      <td>Max persion 4</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Bed:</td>
                      <td>Normal Beds</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Services:</td>
                      <td>Wifi, Television, Bathroom,...</td>
                    </tr>
                  </tbody>
                </table>
                <a href="index.html">
                  <p class="text-decoration-underline text-white m-0 mt-2">Browse Now</p>
                </a>
              </div>
            </div>
            <div class="room-content text-center mt-3">
              <h4 class="display-6 fw-normal"><a href="index.html">Sweet Family room</a></h4>
              <p><span class="text-primary fs-4">$360</span>/night</p>
            </div>
          </div>
          <div class="swiper-slide">
            <div class="room-item position-relative bg-black rounded-4 overflow-hidden">
              <img src="images/room2.jpg" alt="img" class="post-image img-fluid rounded-4">
              <div class="product-description position-absolute p-5 text-start">
                <h4 class="display-6 fw-normal text-white">Perfect Double Room</h4>
                <p class="product-paragraph text-white">Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Molestiae at illum ipsum similique doloribus.</p>
                <table>
                  <tbody>
                    <tr class="text-white">
                      <td class="pe-2">Price:</td>
                      <td class="price">299$ /Pernight</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Size:</td>
                      <td>10 ft</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Capacity:</td>
                      <td>Max persion 2</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Bed:</td>
                      <td>Normal Beds</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Services:</td>
                      <td>Wifi, Television, Bathroom,...</td>
                    </tr>
                  </tbody>
                </table>
                <a href="index.html">
                  <p class="text-decoration-underline text-white m-0 mt-2">Browse Now</p>
                </a>
              </div>
            </div>
            <div class="room-content text-center mt-3">
              <h4 class="display-6 fw-normal"><a href="index.html">Perfect Double Room</a></h4>
              <p><span class="text-primary fs-4">$450</span>/night</p>
            </div>
          </div>
          <div class="swiper-slide">
            <div class="room-item position-relative bg-black rounded-4 overflow-hidden">
              <img src="images/room1.jpg" alt="img" class="post-image img-fluid rounded-4">
              <div class="product-description position-absolute p-5 text-start">
                <h4 class="display-6 fw-normal text-white">Grand deluxe rooms</h4>
                <p class="product-paragraph text-white">Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Molestiae at illum ipsum similique doloribus.</p>
                <table>
                  <tbody>
                    <tr class="text-white">
                      <td class="pe-2">Price:</td>
                      <td class="price">299$ /Pernight</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Size:</td>
                      <td>10 ft</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Capacity:</td>
                      <td>Max persion 2</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Bed:</td>
                      <td>Normal Beds</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Services:</td>
                      <td>Wifi, Television, Bathroom,...</td>
                    </tr>
                  </tbody>
                </table>
                <a href="index.html">
                  <p class="text-decoration-underline text-white m-0 mt-2">Browse Now</p>
                </a>
              </div>
            </div>
            <div class="room-content text-center mt-3">
              <h4 class="display-6 fw-normal"><a href="index.html">Grand deluxe rooms</a></h4>
              <p><span class="text-primary fs-4">$269</span>/night</p>
            </div>
          </div>
          <div class="swiper-slide">
            <div class="room-item position-relative bg-black rounded-4 overflow-hidden">
              <img src="images/room3.jpg" alt="img" class="post-image img-fluid rounded-4">
              <div class="product-description position-absolute p-5 text-start">
                <h4 class="display-6 fw-normal text-white">Sweet Family room</h4>
                <p class="product-paragraph text-white">Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Molestiae at illum ipsum similique doloribus.</p>
                <table>
                  <tbody>
                    <tr class="text-white">
                      <td class="pe-2">Price:</td>
                      <td class="price">299$ /Pernight</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Size:</td>
                      <td>10 ft</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Capacity:</td>
                      <td>Max persion 4</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Bed:</td>
                      <td>Normal Beds</td>
                    </tr>
                    <tr class="text-white">
                      <td class="pe-2">Services:</td>
                      <td>Wifi, Television, Bathroom,...</td>
                    </tr>
                  </tbody>
                </table>
                <a href="index.html">
                  <p class="text-decoration-underline text-white m-0 mt-2">Browse Now</p>
                </a>
              </div>
            </div>
            <div class="room-content text-center mt-3">
              <h4 class="display-6 fw-normal"><a href="index.html">Sweet Family room</a></h4>
              <p><span class="text-primary fs-4">$360</span>/night</p>
            </div>
          </div>
        </div>
        <div class="swiper-pagination room-pagination position-relative mt-5"></div>
      </div>
        </div>
      </div>
      <FooterComponent />
    </div>
  );
}
