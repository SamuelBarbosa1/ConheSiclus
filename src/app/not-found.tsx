import React from 'react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="not-found-container">
            <style dangerouslySetInnerHTML={{
                __html: `
        .not-found-container {
            height: 100vh;
            width: 100vw;
            background-image: url('/error-assets/background.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            overflow: hidden;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 9999;
            font-family: Arial, sans-serif;
        }

        .brand-name {
            position: fixed;
            top: 20px;
            left: 24px;
            font-weight: bold;
            font-size: 1.1rem;
            color: white;
            letter-spacing: 0.5px;
            z-index: 10;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
        }

        .center-container {
            height: 100%;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .error-wrapper {
            position: relative;
            width: 70%;
            max-width: 900px;
        }

        .error-image {
            width: 100%;
            animation: dropDown 5s ease-out forwards;
        }

        .mid-layer-image {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200%;
            opacity: 1;
            z-index: 1;
            pointer-events: none;
        }

        .zero-video {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 100%;
            width: auto;
            object-fit: cover;
            pointer-events: none;
            mix-blend-mode: multiply;
            filter: contrast(1.1) saturate(1.1);
            z-index: 3;
        }

        .text-content {
            position: absolute;
            top: 110%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            width: 100%;
            animation: zoomOut 1s ease-out 2s both;
            z-index: 4;
        }

        .text-content h2 {
            color: black;
            font-size: 2.2rem;
            margin-bottom: 0.8rem;
            font-weight: bold;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
        }

        .text-content p {
            color: white;
            font-size: 1.4rem;
            margin-bottom: 2rem;
            text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7);
        }

        .home-button {
            display: inline-block;
            background: white;
            color: black;
            padding: 14px 35px;
            text-decoration: none;
            font-weight: bold;
            border-radius: 35px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            font-size: 1.15rem;
        }

        .home-button:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
        }

        @keyframes dropDown {
            0% { transform: translateY(-200px); opacity: 0; }
            100% { transform: translateY(-60px); opacity: 1; }
        }

        @keyframes zoomOut {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        @media (max-width: 768px) {
            .brand-name { font-size: 1rem; top: 16px; left: 18px; }
            .error-wrapper { width: 95%; }
            .error-image { animation: none; transform: translateY(-30px); }
            .mid-layer-image { width: 300%; }
            .zero-video { top: 45%; height: 110%; }
            .text-content { top: 125%; width: 90%; }
            .text-content h2 { font-size: 1.6rem; }
            .text-content p { font-size: 1.1rem; }
            .home-button { padding: 12px 28px; font-size: 1rem; }
        }

        @media (max-width: 480px) {
            .mid-layer-image { width: 350%; }
            .zero-video { top: 48%; height: 110%; }
            .text-content { top: 135%; }
            .text-content h2 { font-size: 1.4rem; }
            .text-content p { font-size: 1rem; }
        }
      ` }} />

            <div className="brand-name">ConheSiclus</div>
            <div className="center-container">
                <div className="error-wrapper">
                    {/* 404 */}
                    <img src="/error-assets/404.png" alt="404 Error" className="error-image" />
                    {/* Nuvens */}
                    <img src="/error-assets/clouds.png" alt="" className="mid-layer-image" />
                    {/* Personagem */}
                    <video className="zero-video" src="/error-assets/character.mp4" autoPlay loop muted playsInline></video>
                    {/* Texto abaixo do personagem*/}
                    <div className="text-content">
                        <h2>Ops, parece que estamos perdidos.</h2>
                        <p>Vamos voltar.</p>
                        <Link href="/" className="home-button">Voltar para a página inicial</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
