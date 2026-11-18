-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 11/11/2026 às 21:44
-- Versão do servidor: 10.11.16-MariaDB
-- Versão do PHP: 8.5.12

CREATE DATABASE IF NOT EXISTS campeonato_esportivo
CHARACTER SET utf8mb4;

USE campeonato_esportivo;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


--
-- Banco de dados: `campeonato_esportivo`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `partidas`
--

CREATE TABLE `partidas` (
  `id` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `modalidade` enum('futebol','futsal','basquete','volei') NOT NULL,
  `status` enum('agendada','em andamento','finalizada') NOT NULL DEFAULT 'agendada',
  `data` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `partidas`
--

INSERT INTO `partidas` (`id`, `usuario_id`, `modalidade`, `status`, `data`) VALUES
(1, 1, 'futebol', 'agendada', '2026-11-15 16:00:00'),
(2, 1, 'futsal', 'finalizada', '2026-11-07 17:00:00'),
(3, 1, 'volei', 'agendada', '2026-12-02 14:00:00'),
(4, 1, 'basquete', 'em andamento', '2026-11-17 21:00:00'),
(5, 1, 'futebol', 'em andamento', '2026-11-17 20:00:00'),
(6, 1, 'basquete', 'agendada', '2026-12-10 22:00:00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `partida_time`
--

CREATE TABLE `partida_time` (
  `partida_id` int(10) UNSIGNED NOT NULL,
  `time_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `partida_time`
--

INSERT INTO `partida_time` (`partida_id`, `time_id`) VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 4),
(3, 5),
(3, 6),
(4, 7),
(4, 8),
(5, 9),
(5, 10),
(6, 11),
(6, 12);

-- --------------------------------------------------------

--
-- Estrutura para tabela `times`
--

CREATE TABLE `times` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL,
  `modalidade` enum('futebol','futsal','basquete','volei') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `times`
--

INSERT INTO `times` (`id`, `nome`, `modalidade`) VALUES
(4, 'Atletico-MG', 'futsal'),
(5, 'Barueri', 'volei'),
(8, 'Boston Celtics', 'basquete'),
(7, 'Chicago Bulls', 'basquete'),
(3, 'Cruzeiro', 'futsal'),
(6, 'Flamengo', 'volei'),
(10, 'Gremio', 'futebol'),
(9, 'Internacional', 'futebol'),
(11, 'Lakers', 'basquete'),
(1, 'Santos', 'futebol'),
(2, 'Vasco', 'futebol'),
(12, 'Warriors', 'basquete');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
ALTER TABLE usuarios
ADD COLUMN senha_hash VARCHAR(255) NULL;
--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`) VALUES
(1, 'Usuario Teste', 'teste@exemplo.com');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `partidas`
--
ALTER TABLE `partidas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_partidas_usuario` (`usuario_id`);

--
-- Índices de tabela `partida_time`
--
ALTER TABLE `partida_time`
  ADD PRIMARY KEY (`partida_id`,`time_id`),
  ADD KEY `fk_partida_time_time` (`time_id`);

--
-- Índices de tabela `times`
--
ALTER TABLE `times`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`,`modalidade`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `partidas`
--
ALTER TABLE `partidas`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `times`
--
ALTER TABLE `times`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `partidas`
--
ALTER TABLE `partidas`
  ADD CONSTRAINT `fk_partidas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `partida_time`
--
ALTER TABLE `partida_time`
  ADD CONSTRAINT `fk_partida_time_partida` FOREIGN KEY (`partida_id`) REFERENCES `partidas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_partida_time_time` FOREIGN KEY (`time_id`) REFERENCES `times` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- Validação do nome dos times
ALTER TABLE times
ADD CONSTRAINT ck_times_nome
CHECK (CHAR_LENGTH(TRIM(nome)) >= 3);