#!/bin/bash
# Создание структуры папок для новой фичи
# Использование: ./scaffold.sh <base_path> <feature_name>
# Пример: ./scaffold.sh ./app/src/main/kotlin/com/company/app/feature profile

set -e

BASE_PATH="${1:?Укажи базовый путь (например ./app/src/main/kotlin/com/company/app/feature)}"
FEATURE_NAME="${2:?Укажи имя фичи (например profile)}"

FEATURE_DIR="${BASE_PATH}/${FEATURE_NAME}"

mkdir -p "${FEATURE_DIR}/presentation/screen"
mkdir -p "${FEATURE_DIR}/presentation/view"
mkdir -p "${FEATURE_DIR}/presentation/viewmodel"
mkdir -p "${FEATURE_DIR}/domain/usecase"
mkdir -p "${FEATURE_DIR}/domain/repository"
mkdir -p "${FEATURE_DIR}/data/datasource"
mkdir -p "${FEATURE_DIR}/data/repository"
mkdir -p "${FEATURE_DIR}/di"

echo "Feature structure created at: ${FEATURE_DIR}"
echo ""
echo "  presentation/"
echo "    screen/"
echo "    view/"
echo "    viewmodel/"
echo "  domain/"
echo "    usecase/"
echo "    repository/"
echo "  data/"
echo "    datasource/"
echo "    repository/"
echo "  di/"
